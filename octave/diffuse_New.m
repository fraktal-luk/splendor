function valuesAll = diffuse_New(graphInfo, mainTable, initialStates, initialValues)

    fm = graphInfo.fwMatrix;
    rfm = graphInfo.revMatrix;
    
    valuesAll = nan(1, width(fm));
    
        MAX_ITERS = 30;


    valuesAll(initialStates) = initialValues;
    wave = initialStates;

    
    for i = 1:MAX_ITERS
        nextWave = moveWave(wave, rfm);
        nextWaveU = unique([nextWave{:}]);

        wave = nextWaveU;
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

