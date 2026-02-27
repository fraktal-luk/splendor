
function retval = markOptimalMoves(values, followersMat, states)

retval = false(height(followersMat), width(followersMat));

for i = 1:numel(values)
%   followers = followersMat(:, i);
%   %followers = followers(followers <= numel(values) & followers >= 1);
%   fVals = values(followers);

  for j = 1:height(followersMat)
    follower = followersMat(j, i);
    if follower > numel(values) || isnan(follower) || follower < 1
      continue
    end

    retval(j, i) = (values(follower) == values(i));
  end

end

end

