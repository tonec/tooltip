
/*

OVERVIEW
========
Tooltip plugin which allows for the separation of treatment of desktop and mobile.


REQUIREMENTS
============

Requires John Resig's Micro Templating function - http://ejohn.org/blog/javascript-micro-templating/

The options ismobile and istouch require mobile user agent detection and touch event feature detection not included in this script.


OPTIONS
=======
The following options are available

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

DEPENDENCIES
============

Relies upon the following global variables being set if option: handheld = true.


*/

(function ( $ ) {

	$.fn.frstip = function ( options ) {

		// Default options
		$.fn.frstip.options = {
			actionTouch : 'click',
			actionDesktop : 'hover',
			contentSrc : 'text', // text, html, title or alt
			ttContainerClass : 'frstip',
			ttTargetClass : 'tip-target',
			ttClass : 'tt-content',
			tipTarget : '<a>Hint:<span class="tt-icon">&nbsp;</span></a>',
			tpl : '<span><%=content%></span>',
			inheritedAttribute : false,
			offsetAboveX : 0,
			offsetAboveY : 0,
			offsetBelowX : 0,
			offsetBelowY : 0,
			tooltipOverlap : 0
		};

		// Merge options
		options = $.extend( {}, $.fn.frstip.options, options );

		var that = this,
			ttNum = 0,
			ttClass = options.ttClass,
			ttTargetClassSelector = options.ttTargetClass.replace( / /g, '.' ),
			ttClassSelector = ttClass.replace( / /g, '.' ),
			containerClasses = options.ttContainerClass,
			offsetAboveX = options.offsetAboveX,
			offsetAboveY = options.offsetAboveY,
			offsetBelowX = options.offsetBelowX,
			offsetBelowY = options.offsetBelowY,
			isTouch = CR.util.isTouch();

		CR.tooltipNumcache = CR.tooltipNumcache || [];

		if ( isTouch ) {
			action = options.actionTouch;
		} else {
			action = options.actionDesktop;
		}

		$( this ).each(function () {
			
			// Handle the caching of the tt number.
			do {
				ttNum++;
			} while ( ttNum <= CR.tooltipNumcache );

			CR.tooltipNumcache = ttNum;

			var tipTarget = $( options.tipTarget ),
				tpl = '',
				content = {},
				tt = '';

			tipTarget.addClass( options.ttTargetClass ).attr( 'data-ti', ttNum );
			
			tpl = '<div class="' + ttClass + '" id="tt-' + ttNum + '">' + options.tpl + '</div>';

			// Get tooltip contents
			switch ( options.contentSrc ) {
				case 'text':
					content[ 'content' ]	= $( this ).text();
					break;
				case 'html':
					content[ 'content' ]	= $( this ).html();
					break;
				case 'title':
					content[ 'content' ]	= $( this ).attr( 'title' );
					$( this ).attr( 'title', '' );
					break;
				case 'alt':
					content[ 'content' ]	= $( this ).attr( 'alt' );
					break;
				default:
					content[ 'content' ]	= $( this ).text();
			}

			// Generate tooltip markup using the supplied template
			tt = tmpl( tpl, content );

			// Hide tooltip initially
			tt = $( tt ).css({
				'display' : 'none',
				'position' : 'absolute',
				'z-index' : '1000'
			});

			// Insert tooltip. 
			$( this ).removeClass().addClass( containerClasses ).html( tipTarget );
			$( this ).parent().addClass( 'has-frstip' );
			$( 'body' ).append( tt );
			
			// Set hide/show event types based on the given options
			if ( action === 'hover' ) {
				$( '.' + ttTargetClassSelector ).mouseenter( toggleOn ).mouseleave( toggleOff );
			} 

			if ( action === 'click' ) {
				eventType = 'click';
				$( this ).on( eventType, toggleSwitch );
			}

			// Additional interactions that will close any open tooltips

			// Click anywhere on the page
			$( 'html, body' ).on( 'click', closeAllOpen );
			// Resize window
			$( window ).on( 'throttledresize',  closeAllOpen );
		});

		function toggleSwitch ( e ) {
			var	tgt = $( e.target );

			if ( !tgt.hasClass('tt-open') ) {
				toggleOn( e );
			} else {
				toggleOff( e );
			}
		}

		function toggleOn ( e ) {
			var	tgt = $( e.target ),
				ttNum = tgt.attr( 'data-ti' ),
				currentTT = $( '#tt-' + ttNum );

			e.preventDefault();
			e.stopPropagation();

			closeAllOpen( e );
			setPosition( tgt, currentTT );
			currentTT.css( 'display', 'block' );
			tgt.addClass('tt-open');
		}

		function toggleOff ( e ) {
			var	tgt = $( e.target ),
				ttNum = tgt.attr('data-ti'),
				currentTT = $( '#tt-' + ttNum );

			e.preventDefault();
			e.stopPropagation();

			setPosition( tgt, currentTT );
			currentTT.css('display', 'none');
			tgt.removeClass('tt-open');
		}

		function closeAllOpen ( e ) {

			if ( !$( e.target ) ) return;

			$('.' + ttClassSelector ).filter(':visible').css('display', 'none').parents('.frstip').removeClass('tt-open');
		}

		function setPosition ( tgt, currentTT ) {
			var posX = 0,
				posY = 0,
				scrollTop = $( window ).scrollTop(),
				windowWidth = $( window ).width();

			// Width and height of the target element
			var targetWidth = tgt.width(),
				targetHeight = tgt.height();

				// console.log(targetWidth);
				// console.log(targetHeight);

			// X and Y position of the target element
			var targetX = tgt.offset().left,
				targetY = tgt.offset().top;

				// console.log(targetX);
				// console.log(targetY);

			// Width and height of the tooltip with content
			var contentWidth = currentTT.width(),
				contentHeight = currentTT.height();

				// console.log(contentWidth);
				// console.log(contentHeight);

			// Combine to get top and left positioning
			posX = targetX + targetWidth / 2 - contentWidth / 2;
			posY = targetY - contentHeight + offsetAboveY;

			// Check whether tooltip will fit within left edge
			if ( targetX - ( contentWidth / 2 ) < 0 ) {
				posX = posX + ( contentWidth / 2 );
				currentTT.addClass('left');
			} else {
				currentTT.removeClass('left');
			}

			// Check whether tooltip will fit within right edge
			if ( targetX + ( contentWidth / 2 ) > windowWidth ) {
				posX = posX - ( windowWidth - targetX );
				currentTT.addClass('right');
			} else {
				currentTT.removeClass('right');
			}

			// Appear above if theres enough room. Else show below
			if ( scrollTop > targetY - contentHeight ) {
				currentTT.addClass('bottom');
				posX = posX - offsetAboveX;
				posY = posY + contentHeight + targetHeight;
			} else {
				currentTT.removeClass('bottom');
			}

			// Apply these positions to the tooltip
			var tty = currentTT.css({
				'left' : posX,
				'top' : posY	
			});
		}
	};
})( jQuery );

