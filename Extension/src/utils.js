// Code written by Cashif ilyas
// Distributed under MIT licence
// excitedelektron@gmail.com

function scrollTillEnd(cb, maxScrolls = 1000, delay = 2000)
{    
    cb();
    return;
    
    var scrollsSoFar = 0;
    var lastScrollTop = -1;
    var isScrollLocked = false;
    var intervalId = setInterval(function () {
        if (scrollsSoFar < maxScrolls && !isScrollLocked)
        {
            window.scroll({left: 0, top: $(document).height(), behavior: 'smooth'});
            isScrollLocked = (lastScrollTop == document.scrollingElement.scrollTop);
            lastScrollTop = document.scrollingElement.scrollTop;
            scrollsSoFar++;
        } else
        {
            clearInterval(intervalId);
            cb();
        }
    }, delay);
}