
function [statsTable, statsHistory, finalStatus] = exploreWave_Faster(graphInfo, mainTable, initialStates, INITIAL_STEPS)
    PRUNE = true;
    %INITIAL_STEPS = 16; % 16 -greatly reduces for stadard input

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
    when = nan(1, width(graphInfo.fwMatrix));


    for i = 1:MAX_ITERS
        if nnz(active) == 0
            break
        end

        nA = nnz(active);

           maxV = max(pts(active));
           maxActive = active & pts == maxV;

        if i < INITIAL_STEPS
            waveSubset = find(active);
        else    
            waveSubset = ...find(active);
                     find(maxActive);
        end

        waveNext = moveWave(waveSubset, graphInfo.fwMatrix);
        waveNextU = unique([waveNext{:}]);

        % Remove already visited
        waveNextD = waveNextU;
        waveNextD(visited(waveNextU)) = [];

            foundFinals = any(mainTable.final(waveNextD));

        active(waveNextD) = true;
        active(waveSubset) = false;
        visited(waveSubset) = true;
        
            
        fprintf('%d. A %d, sel %d, next %d, new %d\n', i, nA, numel(waveSubset), numel(waveNextU), numel(waveNextD))
    
            statsTable.active(i) = nA;
            statsTable.visited(i) = nnz(visited);
            statsTable.selected(i) = numel(waveSubset);
            statsTable.next(i) = numel(waveNextU);
            statsTable.new(i) = numel(waveNextD);
            statsTable.solved(i) = nnz(solved);
            statsTable.pv(i) = maxV;

                
                selected = ismember(1:nStates, waveSubset);

%            statsHistory{i} = makeHist2D(mainTable, active);
            statsHistorySel = makeHist2D(mainTable, selected);
            statsHistory{i} = statsHistorySel;

                [iy, ix] = find(statsHistorySel);

                statsTable.minStepA(i) = min(ix);
                statsTable.maxStepA(i) = max(ix);
                statsTable.minPointA(i) = min(iy)-1;
                statsTable.maxPointA(i) = max(iy)-1;

        % Now find
            if ~foundFinals
                continue
            end

            initialStates = find(mainTable.final' & (visited));
            %initialStates = find(mainTable.final' & (visited | active)); %
            %     Somehow visited | active makes much slower search - even than unprunned  
            initialValues = mainTable.value(initialStates);

            newDiff = diffuse_New(graphInfo, mainTable, initialStates, initialValues);
            solvedNew = ~isnan(newDiff);

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
                %solvedNodes = find();
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

                maxStep = max(mainTable.step(active | visited));


                unsolvedSub = subgraphFrom(1, unsolvedMat);
                  % unsolvedSub_M = subgraphFromMasked(1, unsolvedMat, ~solved, maxStep + 2);

                % Mask of reachable unsolved
             %   TMP_unsolvedSub = TMP_subgraphFrom_Exp([1], graphInfo.fwMatrix, isnan(newDiff), maxStep);

                    numActiveSolved = nnz(active & solved);
                 
            % Not much changes in trial. We need stats: how many nodes
            % became solved on each level (step number)?
               activeUp = false(size(active));
               activeUp(unsolvedSub) = active(unsolvedSub);
 
                  %activeUp_M = false(size(active));
                  %activeUp_M(unsolvedSub_M) = active(unsolvedSub_M);


                  %if ~isequal(activeUp_M, activeUp)
                  %     error('dopa')
                  %end

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


function newWave = moveWave(waveIn, followerMat)
    newWave = arrayfun(@(s) getFollowers(s, followerMat), waveIn, 'UniformOutput', false);
    
end


function followers = getFollowers(s, followerMat)
    next = followerMat(:, s);
    next = next(~isnan(next))';
    followers = next;
end

