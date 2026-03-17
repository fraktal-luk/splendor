
oddSteps = mod(stepValues, 2);
evenSteps = ~oddSteps;

optEdges = valuesFrom == valuesTo;

before12 = stepValues < 12; % TODO - change back to 12

os = oddSteps & before12;
es = evenSteps & before12;

evenStarts = es(edgesFrom);
    evenStartsOpt = es(edgesFrom) & optEdges;
oddStarts = os(edgesFrom);
    oddStartsOpt = os(edgesFrom) & optEdges;

% event starts
hold on
quiver(edgesFrom(evenStarts), 0*edgesFrom(evenStarts),...
       0*edgesFrom(evenStarts), edgesTo(evenStarts),... - edgesFrom(evenStarts),...
       0, '.k', 'ShowArrowHead', 'off')

% For odd starts swap x-y
quiver(0*edgesFrom(oddStarts), edgesFrom(oddStarts),...
       edgesTo(oddStarts)... - edgesFrom(oddStarts)...
        , 0*edgesFrom(oddStarts),...
       0, '.k', 'ShowArrowHead', 'off')


% Optimal moves - those where valuesFrom == valuesTo

    quiver(edgesFrom(evenStartsOpt), 0*edgesFrom(evenStartsOpt),...
           0*edgesFrom(evenStartsOpt), edgesTo(evenStartsOpt),... - edgesFrom(evenStartsOpt),...
           0, 'g', 'ShowArrowHead', 'off')

    quiver(0*edgesFrom(oddStartsOpt), edgesFrom(oddStartsOpt),...
           edgesTo(oddStartsOpt)... - edgesFrom(oddStartsOpt)...
            , 0*edgesFrom(oddStartsOpt),...
           0, 'g', 'ShowArrowHead', 'off')

% TODO: find strictly optimal - optimal moves but only from nodes on the best
% path(s)


scatter(edgesFrom(evenStarts), edgesTo(evenStarts), 'r');
scatter(edgesTo(oddStarts), edgesFrom(oddStarts), 'b');

scatter(edgesFrom(evenStartsOpt), edgesTo(evenStartsOpt), 'ro', 'filled' );
scatter(edgesTo(oddStartsOpt), edgesFrom(oddStartsOpt), 'bo', 'filled');
