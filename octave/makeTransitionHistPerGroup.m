function [tabs] = makeTransitionHistPerGroup(edgesFrom, edgesTo, classes, groups)
    
    ugroups = unique(groups);

    tabs = cell(1, numel(ugroups));
    
    for g = 1:numel(ugroups)
        gFrom = edgesFrom(groups == ugroups(g));
        gTo = edgesTo(groups == ugroups(g));
        %gClasses = classes(groups == ugroups(g));
    
        tabs{g} = makeTransitionHist(gFrom, gTo, classes);
    end

end
