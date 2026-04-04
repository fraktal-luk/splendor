% Lets for now assume that 0 is the winner
function res = findSkeleton(followerMat, values, moves)
    skeletonMat = followerMat;

    for i = 1:numel(values)
        if moves(i) == 0
            followers = followerMat(:, i);
            followersOK = followers(~isnan(followers));
            fValues = values(followersOK);
            goodFollowers = followersOK(fValues == values(i));

            skeletonMat(:, i) = nan;
            skeletonMat(1:numel(goodFollowers), i) = goodFollowers;
        end
    end


    res = subgraphFrom(1, skeletonMat);
end
