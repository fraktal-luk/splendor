
function retval = countSteps(mat)

nStates = width(mat);

% rank each state by number of steps
steps = inf(1, nStates);
steps(1) = 1;

retval = countStepsGeneral(mat, steps);

end

