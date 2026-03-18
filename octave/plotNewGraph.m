function plotNewGraph(edgesFrom, edgesTo, values, stepValues, LABELS)
    
    oddSteps = mod(stepValues, 2);
    evenSteps = ~oddSteps;
    
    valuesFrom = values(edgesFrom);
    valuesTo = values(edgesTo);
    
    optEdges = valuesFrom == valuesTo;
    
    before12 = stepValues < 12; % TODO - change back to 12
    
    os = oddSteps & before12;
    es = evenSteps & before12;
    
    evenStarts = es(edgesFrom);
    evenStartsOpt = es(edgesFrom) & optEdges;
    oddStarts = os(edgesFrom);
    oddStartsOpt = os(edgesFrom) & optEdges;
    
    
    
    eFrom = edgesFrom;
    eTo = edgesTo;

        eFrom = LABELS(edgesFrom);
        eTo = LABELS(edgesTo);
    
    hold on
    quiverEven(eFrom, eTo, evenStarts, '.k')
    quiverOdd(eFrom, eTo, oddStarts, '.k')
    
    % Optimal moves - those where valuesFrom == valuesTo
    
    quiverEven(eFrom, eTo, evenStartsOpt, 'g')
    quiverOdd(eFrom, eTo, oddStartsOpt, 'g')
    
    
    % TODO: find strictly optimal - optimal moves but only from nodes on the best
    % path(s)
    
    
    scatterSelected(eFrom, eTo, evenStarts, 'r')
    scatterSelected(eTo, eFrom, oddStarts, 'b')
    
    scatterSelected(eFrom, eTo, evenStartsOpt, 'ro', 'filled')
    scatterSelected(eTo, eFrom, oddStartsOpt, 'bo', 'filled')

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
