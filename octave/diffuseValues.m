
% diffusion: for degree steps find best move value with lookahead of 1;
%            equiv. to finding best future with lookahead of degree?
function retval = diffuseValues(values, followersMat, states, degree)

retval = cell(1, degree);

currentV = values;
movers = cellfun(@(x) x.moves, states);

for i = 1:numel(retval)
  newV = diffuseOnce(currentV, followersMat, movers);
  retval{i} = newV;
  currentV = newV;
end

end



function out = diffuseOnce(vec, followersMat, movers)

out = nan(1, numel(vec));

for i = 1:numel(vec)
  mover = movers(i);
  followers = followersMat(:, i);
  followers = followers((followers <= numel(vec)) & (followers >= 1));

  follValues = vec(followers);

  if i == 332
    1;

  end

   % TODO: dont do sorting, just find max/min (hadling of NaNs
   % properly...)!
   error('Never use this functin before solving comment above!!!')
  if mover == 0
    sorted = sortScores(follValues);
  else
    sorted = -sortScores(-follValues);
  end

  if ~isempty(sorted)
    out(i) = sorted(end);
  end
end

end

