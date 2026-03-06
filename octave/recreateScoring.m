% Here we reconstruct valueVector based on tree shape and final states

recValues = nan(1, nStates);
recValues(finals) = diffVector(finals);

[gameValues, reverseSteps] = diffuseValues(recValues, followerMat, moves, finals);

save gameValues gameValues reverseSteps
