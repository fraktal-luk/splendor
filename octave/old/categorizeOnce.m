function [res] = categorizeOnce(inValues, followerMat, movers)

% res = char(1, numel(inValues));
% res(:) = 'T';
res = repmat('T', 1, numel(inValues));

%found = false(size(res));

for i = 1:numel(inValues)
    if (inValues(i) > 0)
        res(i) = '0';
        continue
    elseif inValues(i) <= 0
        res(i) = '1';
        continue
    end
    
    followers = followerMat(:, i);
    followersOK = followers(~isnan(followers));

    if isempty(followersOK); continue; end



    fValues = inValues(followersOK);
    fNans = isnan(fValues);

    if (movers(i) == 0)
        if any(fValues > 0)
            res(i) = '0';
        elseif all(fNans) 
            res(i) = 'U';
        elseif any(fNans)
            res(i) = 'b';
        else
            res(i) = '1';
        end
    else % mover 1
        if any(fValues <= 0)
            res(i) = '1';
        elseif all(fNans) 
            res(i) = 'U';
        elseif any(fNans)
            res(i) = 'a';
        else
            res(i) = '0';
        end
    end
end

