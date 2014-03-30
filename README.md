
#Tooltip

Tooltip plugin which allows for the separation of treatment of desktop and mobile.


###Dependencies

Requires John Resig's Micro Templating function - http://ejohn.org/blog/javascript-micro-templating/

The options ismobile and istouch require mobile user agent detection and touch event feature detection not included in this script.

###Options

The following options together with the default settings are:

actionTouch : 'click' - Tooltip trigger event for douch divices.
actionDesktop : 'hover' - Tooltip trigger event for desktop.
contentSrc : 'text' - Content source can be text, html, title or alt.
ttContainerClass : 'frstip' - Class(es) added to container.
ttTargetClass : 'tip-target' - Class(es) added to target.
ttClass : 'tt-content' - Class(es) added to the tooltip.
tipTarget : '<a>Hint:<span class="tt-icon">&nbsp;</span></a>' - Target html.
tpl : '<span><%=content%></span>' - Tooltip template for default and desktop.
inheritedAttribute : false 
offsetAboveX : 0 - Offset X for tooltip when above target.
offsetAboveY : 0 - Offset Y for tooltip when above target.
offsetBelowX : 0 - Offset X for tooltip when below target.
offsetBelowY : 0 - Offset Y for tooltip when below target.
tooltipOverlap : 20 - Adjust the tooltip position for left and right positioning relative to the trigger.
inline : tooltip - Tooltip source is already an anchor.