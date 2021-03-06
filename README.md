
# Tooltip

Tooltip plugin which allows for the separation of treatment of desktop and mobile.


### Dependencies

Requires John Resig's Micro Templating function - http://ejohn.org/blog/javascript-micro-templating/

The options ismobile and istouch require mobile user agent detection and touch event feature detection not included in this script.

### Options

The following options together with the default settings are:

- actionDefault : 'hover' - Tooltip trigger event for non.
- actionTouch : 'click' - Tooltip trigger event for touch enabled divices.
- contentSrc : 'text' - The content source: text, html, title or alt.
- ttContainerClass : 'tip' - Class(es) added to container.
- ttTargetClass : 'tip-target' - Class(es) added to target.
- ttClass : 'tip-content' - Class(es) added to the tooltip.
- replaceTarget : false - Replace tooltip source element with tipTarget html.
- tipTarget : '<span class="tt">&nbsp;</span></a>' - Target html.
- tpl : '<span><%=content%></span>' - Tooltip template.
- inheritedAttribute : false 
- offsetAboveX : 0 - Offset X for tooltip when above target.
- offsetAboveY : 0 - Offset Y for tooltip when above target.
- offsetBelowX : 0 - Offset X for tooltip when below target.
- offsetBelowY : 0 - Offset Y for tooltip when below target.
- tooltipOverlap : 20 - Adjust the tooltip position for left and - right positioning relative to the trigger.

### Example usage

    $( '.tip' ).tooltip( {
        contentSrc: 'title',
        tooltipOverlap : 20,
        tpl: '<div class="pod"><div class="pod-inner"><p><%=content%></p></div><span class="tri">&nbsp;</span></div>'
    });

    $( '.tt' ).tooltip( {
        contentSrc: 'title',
        tooltipOverlap : 20,
        replaceTarget: true,
        tpl: '<div class="pod"><div class="pod-inner"><p><%=content%></p></div><span class="tri">&nbsp;</span></div>'
    });