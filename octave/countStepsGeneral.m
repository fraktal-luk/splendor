
function retval = countStepsGeneral(mat)

nStates = columns(mat);

% rank each state by number of steps
steps = inf(1, nStates);
steps(1) = 1;

for i = 1:nStates #n
  value = steps(i);
  following = mat(:, i);
  for f = 1:numel(following)
    this = following(f);
    if isnan(this) || this > nStates; continue; end
    steps(this) = min(steps(this), value+1);
  endfor

end

retval = steps;

endfunction

