
function [retval, mf, revSteps] = diffuseValuesQuick_Src(inValues, followerMat, moves, finals)


recValues = inValues;
% How many sepsof backtracking form finals to set the value?
reverseSteps = nan(size(finals));
reverseSteps(finals) = 0; 

mfInitial = nan(size(finals));
mfInitial(finals) = find(finals);

mf = mfInitial;

nDone = nnz(finals);
loopCount = 0;

vv = nan(size(finals));
vv(finals) = recValues(finals);

while loopCount <= 26 % safety limit
    if loopCount == 26; warning 'Reached max iterations'; end
    
    loopCount = loopCount + 1;
    nDonePrev = nDone;

    [vv, mf, foundNow] = diffuseValuesOnceQuick_Src(vv, mf, followerMat, moves);
    reverseSteps(foundNow) = loopCount;

    nDone = nnz(~isnan(vv));
        %disp(nDone)

    if nDone == nDonePrev
        %disp 'Stop backtracking'
        break
    end
end

retval = vv;
revSteps = reverseSteps;
