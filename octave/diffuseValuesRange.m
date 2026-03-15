
function [retval] = diffuseValuesRange(inValues, followerMat, moves, finals, uval)

assert (isequal(size(inValues), [1, width(followerMat)]))

loopCount = 0;

vv = repmat(uval, 1, width(inValues));
vv(1, finals) = inValues(finals);
vv(2, finals) = inValues(finals);

nFoundAll = nnz(finals);

while loopCount <= 26 % safety limit
    if loopCount == 26; warning 'Reached max iterations'; end
    
    loopCount = loopCount + 1;

    [vv, foundNow] = diffuseValuesOnceRange(vv, followerMat, moves, uval);
    nFound = nnz(foundNow);
    nFoundAll = nFoundAll + nFound;
    disp(nFoundAll)

    if nFound == 0
        disp 'Stop backtracking'
        break
    end
end

retval = vv;
