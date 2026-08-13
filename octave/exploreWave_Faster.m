
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

        maxV = max(pts(active));
        maxActive = active & pts == maxV;

        if i < INITIAL_STEPS
            waveSubset = find(active);
        else    
            waveSubset = find(maxActive);
        end

        waveNextU = waveNextUnique(waveSubset, graphInfo.fwMatrix);

        % Remove already visited
        waveNextD = waveNextU;
        waveNextD(visited(waveNextU)) = [];

        foundFinals = any(mainTable.final(waveNextD));

        active(waveNextD) = true;
        active(waveSubset) = false;
        visited(waveSubset) = true;
                    
        fprintf('%d. A %d, sel %d, next %d, new %d\n', i, nA, numel(waveSubset), numel(waveNextU), numel(waveNextD))

        % Now find
        if ~foundFinals
            continue
        end

        initialStates = find(mainTable.final' & (visited) & ~doneFinals);

        doneFinals(initialStates) = true; % To prevent repeated usage of finals

        initialValues = mainTable.value(initialStates);

        newDiff = diffuse_New(graphInfo, mainTable, initialStates, initialValues, computedValues);
        solvedNew = ~isnan(newDiff);
        computedValues = newDiff;

        when(solvedNew & ~solved) = i;

        newSolvedNum = nnz(solvedNew) - nnz(solved);

        if newSolvedNum == 0
            continue
        else
            fprintf('New solved nodes: %d\n', newSolvedNum)
        end

        solved = solvedNew;

        if ~isnan(newDiff(1))
            disp 'TREE SOLVED'
            break
        end

        if ~PRUNE
            continue
        end

        unsolvedMat = graphInfo.fwMatrix;
        unsolvedMat(:, ~isnan(newDiff)) = nan;

        % TODO: this is perfmornce bottleneck.
        % We need better way to prune.
        % Proposition: for all 'active', remove fro active list those that have
        % only 'solved' predecessors.
        % Reverse mat should provide easy access to this data
        % Also, is it possible to be solved & active? If so, remove
        % too
        % !! Problem: 'solved' state must first propagate to
        % followers of solved nodes

        %maxStep = max(mainTable.step(active | visited));

        unsolvedSub = subgraphFrom(1, unsolvedMat);
        
        %numActiveSolved = nnz(active & solved);
         
        % Not much changes in trial. We need stats: how many nodes
        % became solved on each level (step number)?
        activeUp = false(size(active));
        activeUp(unsolvedSub) = active(unsolvedSub);

        if nnz(activeUp) ~= nnz(active)
            fprintf("Reduced acvte: %d\n", nnz(active & ~activeUp));
        end

        active = activeUp;
    end

    fprintf('Visited: %d\nSolved: %d\n', nnz(visited), nnz(~isnan(newDiff)))
    
    finalStatus.visited = visited;
    finalStatus.active = active;
    finalStatus.values = newDiff;
    finalStatus.when = when;
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

