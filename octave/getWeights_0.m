% Find weights like this: W(a,b) 0 if sign(V(a)) == sign(V(b)), otherwise 1
function W = getWeights_0(followerMat, valueVector)

W = nan(size(followerMat));

for id = 1:width(followerMat)
    followers = followerMat(:, id);
    fVals = indexN(followers, valueVector);
    W(:, id) = sign(fVals) == sign(valueVector(id));
end

W(isnan(followerMat)) = nan;
