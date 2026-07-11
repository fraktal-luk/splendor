function res = makeGuesses(values, followerMat, finals, tips)


loopCount = 0;

vv = char(size(values));
vv(:) = 'U';

vv(finals) = 'F';
vv(tips) = 'T';

nDone = nnz(vv ~= 'U');


while loopCount <= 26 % safety limit
    if loopCount == 26; warning 'Reached max iterations'; end
    
    loopCount = loopCount + 1;
    nDonePrev = nDone;

    [vv] = makeGuessesOnce(vv, values, followerMat, moves);

    nDone = nnz(vv ~= 'U');
    disp(nDone)

    if nDone == nDonePrev
        dsip 'done guessing'
        break
    end
end

res = vv;
