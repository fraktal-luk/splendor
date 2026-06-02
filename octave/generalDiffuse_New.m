function values = generalDiffuse_New(graphInfo, startValues, startWave, func)

    revGraphInfo.fwMatrix = graphInfo.revMatrix;
    revGraphInfo.revMatrix = graphInfo.fwMatrix;
    revGraphInfo.eFrom = graphInfo.eTo;
    revGraphInfo.eTo = graphInfo.eFrom;
    revGraphInfo.fwW = graphInfo.revW;
    revGraphInfo.revW = graphInfo.fwW;

    iter = 0;
    
    values = startValues;
    wave = startWave;

    while true
        if isempty(wave); break; end

        iter = iter + 1;

        % find next wvefront (graph FW)
        newWave = moveWave(wave, graphInfo);

        currentVals = values(newWave);

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
        [followers, weights] = getFollowers(id, revGraphInfo);
        if isempty(followers)
            val = ownVal;
            return
        end
    
        fVals = values(followers);
        val = func(fVals, weights, ownVal);
    end


end


function [followers, weights] = getFollowers(id, gi)
    followersAll = gi.fwMatrix(:, id);
        weightsAll = gi.fwW(:, id);

    followers = followersAll(~isnan(followersAll))';
    weights = weightsAll(~isnan(followersAll))';

       % followers_Alt = gi.eTo(find(gi.eFrom == id))';
    % 
    %     assert (isequal(followers_Alt, followers))
end

function newWave = moveWave(wave, gi)
    waveNext = cell(1, numel(wave));
    for i = 1:numel(waveNext)
        waveNext{i} = getFollowers(wave(i), gi);
    end

    newWave = unique([waveNext{:}]);
end
