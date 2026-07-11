% Lets for now assume that 0 is the winner
function [res, skeletonMat] = findSkeleton_Both(followerMat, values, moves)
    skeletonMat = followerMat;

    for i = 1:numel(values)
        %if moves(i) == 0
            followers = followerMat(:, i);
            followersOK = followers(~isnan(followers));
            fValues = values(followersOK);


            goodFollowers = followersOK(sign(fValues) == sign(values(i)));

            % fValues_N = indexN(followerMat(:, i), values);
            % goodFollowers_N = followers(fValues_N == values(i));

            % assert (isempty(goodFollowers) && isempty(goodFollowers_N) || isequal(goodFollowers_N, goodFollowers))

            skeletonMat(:, i) = nan;
            skeletonMat(1:numel(goodFollowers), i) = goodFollowers;
        %end
    end


    res = subgraphFrom(1, skeletonMat);
end
