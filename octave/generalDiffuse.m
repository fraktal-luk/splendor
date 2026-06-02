function values = generalDiffuse(graphInfo, startValues, startWave, func)

    followerMat = graphInfo.fwMatrix;
    revMat = graphInfo.revMatrix;


    iter = 0;
    
    values = startValues;
    wave = startWave;

    while true
        if isempty(wave); break; end

        iter = iter + 1;

        % find next wvefront (graph FW)
        newWave = moveWave(wave, followerMat);

        % ?? rm from wavefront the nodes that are already done? How to find?

        % foreach (wavefront) get current value
        currentVals = values(newWave);

        %Careful: kernel must be defined in each iteration because 'values'
        % changes throught the loop
        kernel = @(x) apply(x, revMat, values, func);

        % foreach (wavefront) calculate new value
        newVals = arrayfun(kernel, newWave);

        % compare current value with new (nans are equal!)
        sameValues = (newVals == currentVals) | isnan(currentVals) & isnan(newVals);

        newWave(sameValues) = [];
        newVals(sameValues) = [];

        values(newWave) = newVals;
        
        wave = newWave;
    end
end


function followers = getFollowers(id, followerMat)
    followersAll = followerMat(:, id);
    followers = followersAll(~isnan(followersAll))';
end

function newWave = moveWave(wave, followerMat)
    waveNext = arrayfun(@(x)getFollowers(x, followerMat), wave, 'UniformOutput', false);
    newWave = unique([waveNext{:}]);
end

function val = apply(id, revMat, values, func)
    ownVal = values(id);
    followers = getFollowers(id, revMat);
    if isempty(followers)
        val = ownVal;
        return
    end

    fVals = values(followers);
    val = func(fVals, [], ownVal);
end

% function newVals = getNewVals(wave, revMat, values, func)
% 
% end
