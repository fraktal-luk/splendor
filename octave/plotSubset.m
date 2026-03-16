function plotSubset(edgesFrom, edgesTo, stepValues, boolSelector, spec)

stepsK = stepValues(boolSelector);
statesK = find(boolSelector);

edgeStartsK = edgesFrom(boolSelector(edgesFrom))';
edgeEndsK = edgesTo(boolSelector(edgesFrom))';

vx = stepValues(edgeEndsK) - stepValues(edgeStartsK);
vy = edgeEndsK - edgeStartsK;
%vz = plotValues(chTo) - plotValues(chFrom);


quiver(stepValues(edgeStartsK), edgeStartsK, vx, vy, 0, spec, 'ShowArrowHead', 'off')
hold on

scatter(stepsK, statesK, 'bo')

