function values = generalDiffuse_New(graphInfo, startValues, startWave, func)

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
       % newVals = arrayfun(kernel, newWave);
            newVals = calcNewVals(newWave);

        % compare current value with new (nans are equal!)
        sameValues = (newVals == currentVals) | isnan(currentVals) & isnan(newVals);

        newWave(sameValues) = [];
        newVals(sameValues) = [];

        values(newWave) = newVals;
        
        wave = newWave;
    end


    function res = calcNewVals(newWave)
        res = nan(size(newWave));
        
        for i = 1:numel(res)
            res(i) = apply(newWave(i));
        end
    end
    
    
    function val = apply(id)
        ownVal = values(id);
        followers = getFollowers(id, followerMat);
        if isempty(followers)
            val = ownVal;
            return
        end
    
        fVals = values(followers);
        val = func(fVals, ownVal);
    end

    function followers = getFollowers(id, follMat)
        followersAll = follMat(:, id);
        followers = followersAll(~isnan(followersAll))';

        % followers_Alt = graphInfo.eTo(find(graphInfo.eFrom == id))';
        % 
        %     assert (isequal(followers_Alt, followers))
    end

    function newWave = moveWave(wave, follMat)
        waveNext = cell(1, numel(wave));
        %waveNext = arrayfun(@(x)getFollowers(x), wave, 'UniformOutput', false);
        for i = 1:numel(waveNext)
            waveNext{i} = getFollowers(wave(i), follMat);
        end

        newWave = unique([waveNext{:}]);
    end

end
