
function retval = countStepsGeneral(mat, initialSteps)

nStates = width(mat);

assert(numel(initialSteps) == width(mat), 'Wrong dimensions');

steps = single(initialSteps);

for i = 1:nStates
  value = steps(i);
  for f = 1:height(mat)
    this = mat(f, i);
    if isnan(this); break; end
    if this > nStates; continue; end
    steps(this) = min(steps(this), value+1);
  end

end

retval = steps;

end

