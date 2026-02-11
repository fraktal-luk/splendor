
function [x, y, u, v] = calcVectors(followerMat, xv, yv, values)

len = numel(xv);

x = repmat(xv, [13, 1]);
y = repmat(yv, [13, 1]);

u = nan(13, len);
v = nan(13, len);

for i = 1:len
    %if isnan(values(i)); continue; end

  followers = followerMat(:, i);
  followers = followers(~isnan(followers) & followers <= len);

  yf = yv(followers);

  for j = 1:numel(followers)
      v(j, i) = yf(j) - yv(i);
      u(j, i) = 1;
  end


end



