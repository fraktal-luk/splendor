
function [statsTable, statsHistory, finalStatus] = exploreWave_Faster(graphInfo, mainTable, initialStates, INITIAL_STEPS)
    PRUNE = true;

    MAX_ITERS = 10000;
    nStates = width(graphInfo.fwMatrix);

    statsTable = table();
    statsTable.active = nan(MAX_ITERS, 1);
    statsTable.visited = nan(MAX_ITERS, 1);
    statsTable.selected = nan(MAX_ITERS, 1);
    statsTable.solved = nan(MAX_ITERS, 1);
    statsTable.next = nan(MAX_ITERS, 1);
    statsTable.new = nan(MAX_ITERS, 1);
    statsTable.pv = nan(MAX_ITERS, 1);

    statsTable.minStepA = nan(MAX_ITERS, 1);
    statsTable.maxStepA = nan(MAX_ITERS, 1);
    statsTable.minPointA = nan(MAX_ITERS, 1);
    statsTable.maxPointA = nan(MAX_ITERS, 1);

    statsHistory = cell(1, MAX_ITERS);

    pts = max(mainTable.p0, mainTable.p1)';

    wave = unique(initialStates);

    active = false(1, width(graphInfo.fwMatrix));
    active(wave) = true;
    visited = false(1, width(graphInfo.fwMatrix));
    solved = false(1, width(graphInfo.fwMatrix));
    doneFinals = false(1, width(graphInfo.fwMatrix));
    computedValues = nan(1, width(graphInfo.fwMatrix));
    when = nan(1, width(graphInfo.fwMatrix));

    for i = 1:MAX_ITERS
        nA = nnz(active);

        if nA == 0; break; end

        waveSubset = selectSubset(active, pts, i, INITIAL_STEPS);
        waveNextU = waveNextUnique(waveSubset, graphInfo.fwMatrix);

        visited(waveSubset) = true;
        active(waveNextU) = true;
        active(visited) = false;

        fprintf('%d. A %d, sel %d, next %d\n', i, nA, numel(waveSubset), numel(waveNextU))

        initialStates = find(mainTable.final' & active & ~doneFinals);

        if isempty(initialStates); continue; end 

        initialValues = mainTable.value(initialStates);

        doneFinals(initialStates) = true; % To prevent repeated usage of finals

        computedValues = diffuse_New(graphInfo, mainTable, initialStates, initialValues, computedValues);

        solvedNew = ~isnan(computedValues);

        fprintf('New solved nodes: %d\n', nnz(solvedNew) - nnz(solved))

        solved = solvedNew;

        if solved(1)
            disp 'TREE SOLVED'
            break
        end

        if ~PRUNE; continue; end

        activeUp = updateActive(active, graphInfo.fwMatrix, computedValues);

        active = activeUp;
    end

    fprintf('Visited: %d\nSolved: %d\n', nnz(visited), nnz(~isnan(computedValues)))
    
    finalStatus.visited = visited;
    finalStatus.active = active;
    finalStatus.values = computedValues;
    finalStatus.when = when;
end



function waveSubset = selectSubset(active, pts, i, INITIAL_STEPS)
    maxV = max(pts(active));
    maxActive = active & pts == maxV;

    if i < INITIAL_STEPS
        waveSubset = find(active);
    else    
        waveSubset = find(maxActive);
    end
end


function activeUp = updateActive(active, followerMat, computedValues)
    unsolvedMat = followerMat;
    unsolvedMat(:, ~isnan(computedValues)) = nan;

    unsolvedSub = subgraphFrom(1, unsolvedMat);
    
    activeUp = false(size(active));
    activeUp(unsolvedSub) = active(unsolvedSub);
end


function waveNextU = waveNextUnique(waveIn, followerMat)
     waveNext = moveWave(waveIn, followerMat);
     waveNextU = unique([waveNext{:}]);
end

function newWave = moveWave(waveIn, followerMat)
    newWave = arrayfun(@(s) getFollowers(s, followerMat), waveIn, 'UniformOutput', false);
    
end


function followers = getFollowers(s, followerMat)
    next = followerMat(:, s);
    next = next(~isnan(next))';
    followers = next;
end

