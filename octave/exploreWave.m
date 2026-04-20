function exploreWave(followerMat, finals, ignored)
    LIMIT = 400;

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

        % if i < 10
        %     disp([visited(1:50); active(1:50)])
        % end

            disp(nnz(visited & finals))

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
