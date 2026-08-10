function visited = TMP_subgraphFrom_Exp(initialStates, followerMat, mask, nSteps)

    nStates = width(followerMat);

    visited = false(1, nStates);

    wave = initialStates;
    
    for i = 1:nSteps
        visited(wave) = true;

        if numel(wave) == 0
            break
        end

        moved = moveWave(wave, followerMat);
        waveNext = unique(cell2mat(moved));

        % Now: remove visited ones
        waveNextVisited = visited(waveNext);
        waveNextInMask = mask(waveNext);

        wave = waveNext(waveNextInMask & ~waveNextVisited);
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