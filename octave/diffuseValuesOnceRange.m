function [res, found] = diffuseValuesOnceRange(inValues, followerMat, movers)

assert(isequal(size(inValues), [2, width(followerMat)]))

res = inValues;
found = false(1, width(res));

for i = width(inValues):-1:1
    if ~isequal(res(:, i), [-inf; inf]); continue; end % U nodes only

    followers = followerMat(:, i);
    followersOK = followers(~isnan(followers));

    if isempty(followersOK); continue; end

    fValues = res(:, followersOK);
    fMax = max(fValues, [], 2);
    fMin = min(fValues, [], 2);

    if (movers(i) == 0)
        newVal = fMax;
    else % mover 1
        newVal = fMin;
    end

    if ~isequal(newVal, [-inf; inf])
        res(:, i) = newVal;
        found(i) = true;
    end
end

