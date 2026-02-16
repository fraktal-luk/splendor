
function retval = getRelativeInds(stepValues, valueVec)

retval = nan(1, numel(stepValues), 'single'); % index of each state among those with equal step value

for s = 1:max(stepValues)
    levelStates = find(stepValues == s);
    indices = 1:numel(levelStates);

      % sort by value
      [~, order] = (sortScores(valueVec(levelStates))); % sort(-valueVector(levelStates));

    retval(levelStates((order))) = indices;
end

endfunction
