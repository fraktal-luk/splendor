function plotExploration(stats)

plot(stats.vActive, 'ko-')
hold on
plot(stats.vSelected, 'r')
plot(stats.vExpanded, 'b')
plot(stats.vNextActive, 'kp-')
plot(stats.vReduced, 'kd-')

end
