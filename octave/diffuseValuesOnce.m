function [res, found] = diffuseValuesOnce(inValues, followerMat, movers)

res = inValues;
found = false(size(res));

for i = 1:numel(inValues)
    if ~isnan(inValues(i)); continue; end % node already known

    followers = followerMat(:, i);
    followersOK = followers(~isnan(followers));

    if isempty(followersOK); continue; end

    fValues = inValues(followersOK);
    fMax = max(fValues);
    fMin = min(fValues);
    hasNaN = any(isnan(fValues));

    if (movers(i) == 0)
        if fMax <= 0 && hasNaN
            % do nothing
        else
            res(i) = fMax;
            found(i) = true;
        end
    else % mover 1
        if fMin >= 0 && hasNaN
            % do nothing
        else
            res(i) = fMin;
            found(i) = true;
        end
    end
end

