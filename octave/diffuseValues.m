
function [retval, revSteps] = diffuseValues(inValues, followerMat, moves, finals)


recValues = inValues;
% How many sepsof backtracking form finals to set the value?
reverseSteps = nan(size(finals));
reverseSteps(finals) = 0; 


nDone = nnz(finals);
loopCount = 0;

vv = recValues;

while loopCount <= 26 % safety limit
    if loopCount == 26; warning 'Reached max iterations'; end
    
    loopCount = loopCount + 1;
    nDonePrev = nDone;

    [vv, foundNow] = diffuseValuesOnce(vv, followerMat, moves);
    reverseSteps(foundNow) = loopCount;

    nDone = nnz(~isnan(vv));
    disp(nDone)

    if nDone == nDonePrev
        disp 'Stop backtracking'
        break
    end
end

retval = vv';
revSteps = reverseSteps;
