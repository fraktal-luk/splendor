
oddSteps = mod(stepValues, 2);
evenSteps = ~oddSteps;

before12 = stepValues < 10; % TODO - change back to 12

os = oddSteps & before12;
es = evenSteps & before12;

evenStarts = es(edgesFrom);
oddStarts = os(edgesFrom);

% event starts
scatter(edgesFrom(evenStarts), edgesTo(evenStarts), 'r');
hold on
quiver(edgesFrom(evenStarts), 0*edgesFrom(evenStarts),...
       0*edgesFrom(evenStarts), edgesTo(evenStarts),... - edgesFrom(evenStarts),...
       0, 'k', 'ShowArrowHead', 'off')

% For odd starts swap x-y
scatter(edgesTo(oddStarts), edgesFrom(oddStarts), 'b');
quiver(0*edgesFrom(oddStarts), edgesFrom(oddStarts),...
       edgesTo(oddStarts)... - edgesFrom(oddStarts)...
        , 0*edgesFrom(oddStarts),...
       0, 'k', 'ShowArrowHead', 'off')
