% TODO

function exploreWave_Faster(graphInfo, mainTable, initialStates)
    MAX_ITERS = 26;
    nStates = width(graphInfo.fwMatrix);

    wave = unique(initialStates);



    active = false(1, width(graphInfo.fwMatrix));
    active(wave) = true;
    visited = false(1, width(graphInfo.fwMatrix));
    
    

    for i = 1:MAX_ITERS
        if nnz(active) == 0
            break
        end

        nA = nnz(active);
        waveSubset = find(active);


        waveNext = moveWave(waveSubset, graphInfo.fwMatrix);
        waveNextU = unique([waveNext{:}]);

        % Remove already visited
        waveNextD = waveNextU;
        waveNextD(visited(waveNextU)) = [];

        active(waveNextD) = true;
        active(waveSubset) = false;
        visited(waveSubset) = true;
        
        fprintf('A %d, sel %d, next %d, new %d\n', nA, numel(waveSubset), numel(waveNextU), numel(waveNextD))
    
        % Now find 
            initialStates = find(mainTable.final' & visited);
            initialValues = mainTable.value(initialStates);

            newDiff = diffuse_New(graphInfo, mainTable, initialStates, initialValues);
            
            if ~isnan(newDiff(1))
                disp Solved
                break
            end
    end

end


function newWave = moveWave(waveIn, followerMat)
    newWave = arrayfun(@(s) getFollowers(s, followerMat), waveIn, 'UniformOutput', false);
    
end


function followers = getFollowers(s, followerMat)
    next = followerMat(:, s);
    next = next(~isnan(next))';
    followers = next;
end

