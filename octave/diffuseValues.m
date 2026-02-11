
function retval = diffuseValues(values, followersMat, states, degree)

retval = cell(1, degree);

currentV = values;
movers = cellfun(@(x) x.moves, states);

for i = 1:numel(retval)
  newV = diffuseOnce(currentV, followersMat, movers);
  retval{i} = newV;
  currentV = newV;
end

endfunction



function out = diffuseOnce(vec, followersMat, movers)

out = nan(1, numel(vec));

for i = 1:numel(vec)
  mover = movers(i);
  followers = followersMat(:, i);
  followers = followers((followers <= numel(vec)) & (followers >= 1));

  follValues = vec(followers);

  if i == 332
    1;

  endif


  if mover == 0
    sorted = sortScores(follValues);
  else
    sorted = -sortScores(-follValues);
  endif

  if ~isempty(sorted)
    out(i) = sorted(end);
  end
end

endfunction

