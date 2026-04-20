function exploreWave(followerMat, values, moves, finals, ignored)
    LIMIT = 400 * 2 * 3;

    active = false(1, width(followerMat));
    visited = false(1, width(followerMat));

    active(1) = 1;
    initialState = 1;

    wave = initialState;

    nums = nan(1, 24);

    for i = 1:24
        selected = find(active);

        % Selection process
        if numel(selected) > LIMIT
            selected = selected(1:2:end);
        end

        % Move from selected tips: switch then from active to visited
        visited(selected) = 1;
        active(selected) = 0;

        moved = moveWave(selected, followerMat);
        waveNext = unique(cell2mat(moved));
        wave = waveNext;

        % Set newly discovered as active
            wave(visited(wave)) = [];
            active(wave) = 1;

        nums(i) = numel(wave);

        if nums(i) == 0
            disp('exhausted wave')
            break
        end

        nActiveFinals = nnz(active & finals);
        
        if nActiveFinals == 0
            continue
        end    

        % Diffuse known values
        % ...
        initVals = nan(1, width(followerMat));
        initVals(active & finals) = values(active & finals);
        
        [diffusedVals] = diffuseValuesQuick(initVals, followerMat, moves, active & finals);

        nKnownVals = nnz(~isnan(diffusedVals));
            % disp([nActiveFinals, nKnownVals])


        % Propagate forward from solved nodes (only visited!), eliminate reached
        % ...
        solvedNew = subgraphFrom(find(~isnan(diffusedVals)), followerMat);

            nActivePre = nnz(active);

        active(solvedNew) = 0;

            nActiveNew = nnz(active);

        fprintf('active prev: %d, known %d, active new %d\n', [nActivePre, nKnownVals, nActiveNew])
    end

        disp(nums)
end


function newWave = moveWave(waveIn, followerMat)
    newWave = arrayfun(@(s) getFollowers(s, followerMat), waveIn, 'UniformOutput', false);
    
end


function followers = getFollowers(s, followerMat)
    next = followerMat(:, s);
    next = next(~isnan(next))';
    followers = next;
end
