
function retval = countStepsGeneralMasked(mat, initialSteps, mask, maxStep)

if nargin < 3
    USE_MAX = false;
end
nStates = width(mat);

assert(numel(initialSteps) == width(mat), 'Wrong dimensions');

steps = single(initialSteps);

if false
else
   for i = 1:nStates
      value = steps(i);

            if ~mask(i)
                continue
            end

      % if value >= maxStep
      %   continue
      % end

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

