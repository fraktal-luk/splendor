% Here we reconstruct valueVector based on tree shape and final states

recValues = nan(1, nStates);
recValues(finals) = diffVector(finals);

% How many sepsof backtracking form finals to set the value?
reverseSteps = nan(size(finals));
reverseSteps(finals) = 0; 


nDone = nnz(finals);
loopCount = 0;

vv = recValues;

while loopCount < 25 % safety limit
    loopCount = loopCount + 1;
    nDonePrev = nDone;

    [vv, foundNow] = diffuseValuesOnce(vv, followerMat, moves);
    reverseSteps(foundNow) = loopCount;

    nDone = nnz(~isnan(vv));


    %    divergent = (vv' ~= valueVector) & (~isnan(vv') );
    %if any(divergent); break; end



       disp(nDone)

    if nDone == nDonePrev
        disp 'Stop backtracking'
        break
    end
end

gameValues = vv';

save gameValues gameValues reverseSteps
