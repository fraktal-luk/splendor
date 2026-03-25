function plotNewGraph(edgesFrom, edgesTo, values, stepsOpt, stepValues, LABELS)
    
    plotVals = makeDisplayValues(values);

    oddSteps = mod(stepValues, 2);
    evenSteps = ~oddSteps;
    
    optNodes = stepsOpt == 0;
        optNodes4 = stepsOpt <= 4-1;

    valuesFrom = values(edgesFrom);
    valuesTo = values(edgesTo);
    
    optEdges = optNodes(edgesFrom) & optNodes(edgesTo) ;% valuesFrom == valuesTo;
        optEdges4 = optNodes4(edgesFrom) & optNodes4(edgesTo) ;% valuesFrom == valuesTo;
    
    chosenSteps = stepValues >= 0 & stepValues <= 24;
    
    os = oddSteps & chosenSteps;
    es = evenSteps & chosenSteps;
    
    evenStarts = es(edgesFrom);
    evenStartsOpt = es(edgesFrom) & optEdges;
    evenStartsOpt4 = es(edgesFrom) & optEdges4;
    oddStarts = os(edgesFrom);
    oddStartsOpt = os(edgesFrom) & optEdges;
    oddStartsOpt4 = os(edgesFrom) & optEdges4;
    
    
    
    eFrom = edgesFrom;
    eTo = edgesTo;

         eFrom = LABELS(edgesFrom);
         eTo = LABELS(edgesTo);
    

    oddLabels = LABELS(os);
    evenLabels = LABELS(es);





    subplot(2, 2, 2)

    plot([0, max(eTo(evenStarts)) ], [0, max(eTo(evenStarts))], 'k')
    hold on

    % quiverEven(eFrom, eTo, evenStarts, '.k')
    % quiverOdd(eFrom, eTo, oddStarts, '.k')
    % 
    % quiverEven(eFrom, eTo, evenStartsOpt, '.g')
    % quiverOdd(eFrom, eTo, oddStartsOpt, '.g')

    
    % All edges:
    scatterSelected(eFrom, eTo, evenStarts, 'k.')
    scatterSelected(eTo, eFrom, oddStarts, 'k.')

    scatterSelected(eFrom, eTo, evenStarts & valuesTo > 0, 'rd', 'filled')
    scatterSelected(eFrom, eTo, evenStarts & valuesTo <= 0, 'bd', 'filled')
    % 
    scatterSelected(eTo, eFrom, oddStarts & valuesTo > 0, 'ro', 'filled')
    scatterSelected(eTo, eFrom, oddStarts & valuesTo <= 0, 'bo', 'filled')

    xlimits = xlim();
    ylimits = ylim();
    
    subplot(2, 2, 1)
    plot(plotVals(os), LABELS(os), 'k.')
    ylim(ylimits)

    subplot(2, 2, 4)
    plot(LABELS(es), plotVals(es), 'k.')
    xlim(xlimits)


end


function scatterSelected(eFrom, eTo, select, varargin)
    scatter(eFrom(select), eTo(select), varargin{:})
end

function quiverEven(eFrom, eTo, select, spec)
    quiver(eFrom(select), 0*eFrom(select),...
           0*eFrom(select), eTo(select),... - edgesFrom(evenStarts),...
           0, spec, 'ShowArrowHead', 'off')
end

function quiverOdd(eFrom, eTo, select, spec)
    quiver(0*eFrom(select), eFrom(select),...
           eTo(select), 0*eFrom(select),... - edgesFrom(evenStarts),...
           0, spec, 'ShowArrowHead', 'off')
end
