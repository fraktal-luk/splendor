function [res] = makeGuessesOnce(prev, values, followerMat, movers)

res = prev;

%for i = 1:numel(inValues)
for i = numel(values):-1:1
    %if ~isnan(inValues(i)); continue; end % node already known

    followers = followerMat(:, i);
    followersOK = followers(~isnan(followers));

    if isempty(followersOK); continue; end

    fValues = values(followersOK);
    fCategs = prev(followersOK);
    fFinals = fCategs == 'F';
    fTips = fCategs == 'T';

    % finals are changed to 0/D/1, tips to U
    fCategs(fFinals & fValues > 0) = '0';
    fCategs(fFinals & fValues == 0) = 'D';
    fCategs(fFinals & fValues < 0) = '1';
    fCategs(fTips) = 'U';

    if (movers(i) == 0)

    else % mover 1
        
    end
end
