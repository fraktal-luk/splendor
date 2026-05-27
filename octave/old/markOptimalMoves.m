
function retval = markOptimalMoves(values, followersMat)

retval = false(height(followersMat), width(followersMat));

for i = 1:numel(values)
  for j = 1:height(followersMat)
    follower = followersMat(j, i);

    if isnan(follower)
      break
    end

    if follower > numel(values) || follower < 1
      continue
    end

    retval(j, i) = (values(follower) == values(i));
  end

end

end

