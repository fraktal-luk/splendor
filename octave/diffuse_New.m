function valuesAll = diffuse_New(graphInfo, mainTable, initialStates, initialValues, prevValues)
    if isempty(initialStates)
        fprintf('>> Diffuse with empty input\n')
    else
        fprintf('>> Start diffuse with %d \n', numel(initialStates))
        %initialStates(1:6)
    end

    fm = graphInfo.fwMatrix;
    rfm = graphInfo.revMatrix;
    
    %valuesAll = nan(1, width(fm));
      valuesAll = prevValues;
        MAX_ITERS = 30;


    valuesAll(initialStates) = initialValues;
    wave = initialStates;

    
    for i = 1:MAX_ITERS
        if isempty(wave)
            break
        end


        nextWave = moveWave(wave, rfm);
        nextWaveU = unique([nextWave{:}]);

        nextWaveCurrentVals = valuesAll(nextWaveU);
        nextWaveNewVals = nan(1, numel(nextWaveU));


        for j = 1:numel(nextWaveU)
            nextWaveNewVals(j) = computeValue(nextWaveU(j), graphInfo, mainTable, valuesAll);
        end

        changed = ~isnan(nextWaveNewVals) & (nextWaveNewVals ~= nextWaveCurrentVals);

        % fprintf('  %d: %d ch\n', numel(nextWaveU), nnz(changed))

            valuesAll(nextWaveU) = nextWaveNewVals;

        wave = nextWaveU(changed);
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

function val = computeValue(s, graphInfo, mainTable, allValues)
    followers = getFollowers(s, graphInfo.fwMatrix);

    fVals = allValues(followers);

    val = nan;

    %if mod(mainTable{s, 'step'}, 2) == 1
    if mod(mainTable.step(s), 2) == 1
        optKnown = min(nan, min(fVals));
        
        if optKnown >= 0 && any(isnan(fVals))
            return
        end

        val = optKnown;
    else
        optKnown = max(nan, max(fVals));
        
        if optKnown <= 0 && any(isnan(fVals))
            return
        end

        val = optKnown;
    end
end
