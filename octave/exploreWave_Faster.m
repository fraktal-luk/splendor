
function statsTable = exploreWave_Faster(graphInfo, mainTable, initialStates)
    MAX_ITERS = 10000;
    nStates = width(graphInfo.fwMatrix);

        statsTable = table();
        statsTable.active = nan(nStates, 1);
        statsTable.visited = nan(nStates, 1);
        statsTable.selected = nan(nStates, 1);
        statsTable.next = nan(nStates, 1);
        statsTable.new = nan(nStates, 1);
        statsTable.pv = nan(nStates, 1);

    pts = max(mainTable.p0, mainTable.p1)';


    wave = unique(initialStates);



    active = false(1, width(graphInfo.fwMatrix));
    active(wave) = true;
    visited = false(1, width(graphInfo.fwMatrix));
    
    

    for i = 1:MAX_ITERS
        if nnz(active) == 0
            break
        end

        nA = nnz(active);

           maxV = max(pts(active));
           maxActive = active & pts == maxV;

        if i < 0 % 12
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
            statsTable.pv(i) = maxV;

        % Now find
            if ~foundFinals
                continue
            end

            initialStates = find(mainTable.final' & (visited));
            %initialStates = find(mainTable.final' & (visited | active)); %
            %     Somehow visited | active makes much slower search - even than unprunned  
            initialValues = mainTable.value(initialStates);

            newDiff = diffuse_New(graphInfo, mainTable, initialStates, initialValues);
            
            if ~isnan(newDiff(1))
                disp Solved
                break
            end

                unsolvedMat = graphInfo.fwMatrix;
                %solvedNodes = find();
                unsolvedMat(:, ~isnan(newDiff)) = nan;
                unsolvedSub = subgraphFrom(1, unsolvedMat);

            % Not much changes in trial. We need stats: how many nodes
            % became solved on each level (step number)?
               activeUp = false(size(active));
               activeUp(unsolvedSub) = active(unsolvedSub);
                     
                   active = activeUp;
    end


    fprintf('Visited: %d\n', nnz(visited))

end


function newWave = moveWave(waveIn, followerMat)
    newWave = arrayfun(@(s) getFollowers(s, followerMat), waveIn, 'UniformOutput', false);
    
end


function followers = getFollowers(s, followerMat)
    next = followerMat(:, s);
    next = next(~isnan(next))';
    followers = next;
end

