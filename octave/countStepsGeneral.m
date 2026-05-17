
function retval = countStepsGeneral(mat, initialSteps, USE_MAX)

if nargin < 3
    USE_MAX = false;
end

nStates = width(mat);

assert(numel(initialSteps) == width(mat), 'Wrong dimensions');

steps = single(initialSteps);

if USE_MAX
   for i = nStates:-1:1
      value = steps(i);
      for f = 1:height(mat)
        this = mat(f, i);
        if isnan(this); continue; end
        if this > nStates; continue; end
        
        steps(this) = max(steps(this), value+1);
      end
    end
else
   for i = 1:nStates
      value = steps(i);
      for f = 1:height(mat)
        this = mat(f, i);
        if isnan(this); continue; end
        if this > nStates; continue; end

        steps(this) = min(steps(this), value+1);
      end
    end
end

retval = steps;

end

