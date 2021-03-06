/**
 * 2015.3.24
 * 1 isBrowser
 * 2 isMobile
 * 3 isSurface
 */

const plat = Xut.plat
const TRANSITION_END = plat.TRANSITION_END

//2015.3.23
//可以点击与触摸
const isSurface = plat.isSurface;

//触发事件名
const touchName = ['touchstart', 'touchmove', 'touchend', TRANSITION_END];
const mouseName = ['mousedown', 'mousemove', 'mouseup', TRANSITION_END];

//绑定事件名排序
const orderName = {
    start: 0,
    move: 1,
    end: 2,
    transitionend: 3
}

const EVENT_NAME = function() {
    if (isSurface) {
        return {
            touch: touchName,
            mouse: mouseName
        }
    }
    return [plat.START_EV, plat.MOVE_EV, plat.END_EV, TRANSITION_END];
}()


function _apply(events, callbacks, processor) {
    _.each(callbacks, function(hooks, key) {
        //必须存在回调处理器
        hooks && processor(events[orderName[key]], hooks)
    })
}


/**
 * 合并事件绑定处理
 * 因为isSurface设备上
 * 要同时支持2种方式
 * @return {[type]} [description]
 */
function _bind(context, events, callbacks) {
    _apply(events, callbacks, (eventName, hook) => {
        context.addEventListener(eventName, hook, false)
    })
}

/**
 * 销毁事件绑定处理
 * 因为isSurface设备上
 * 要同时支持2种方式
 * @return {[type]} [description]
 */
function _off(context, events, callbacks) {
    _apply(events, callbacks, (eventName, hook) => {
        context.removeEventListener(eventName, hook, false)
    })
}


/**
 * processor
 * @param  {[type]}   processor    [处理器]
 * @param  {[type]}   eventContext [上下文]
 * @param  {Function} callback     [回调函数]
 * @return {[type]}                [description]
 */
function exec(processor, eventContext, callback) {
    //如果两者都支持
    //鼠标与触摸
    if (isSurface) {
        // touch :['touchstart','touchmove','touchend'],
        // mouse :['mousedown','mousemove','mouseup']
        _.each(EVENT_NAME, function(events) {
            processor(eventContext, events, callback);
        })
    } else {
        processor(eventContext, EVENT_NAME, callback);
    }
}



/**
 * 如果execEvent的callback绑定的this
 *handle(e, {
 *     start: function(e) {
 *         self.onTouchStart(e);
 *     },
 *     move: function(e) {
 *         self.onTouchMove(e);
 *     },
 *     end: function(e) {
 *         self.onTouchEnd(e);
 *     },
 *     transitionend: function(e) {
 *         self.onAnimComplete(e);
 *     }
 * })
 * @return {[type]}           [description]
 */
export function handle(callbacks, context, event) {
    switch (event.type) {
        case 'touchstart':
        case 'mousedown':
            callbacks.start && callbacks.start.call(context, event)
            break;
        case 'touchmove':
        case 'mousemove':
            callbacks.move && callbacks.move.call(context, event)
            break;
        case 'touchend':
        case 'mouseup':
            callbacks.end && callbacks.end.call(context, event)
            break;
        case TRANSITION_END:
            callbacks.transitionend && callbacks.transitionend.call(context, event)
            break;
    }
}


/**
 * 合并事件绑定处理
 * 因为isSurface设备上
 * 要同时支持2种方式
 * bindTap(eventContext,{
 *     start   : start,
 *     move    : move,
 *     end     : end
 * })
 * @return {[type]} [description]
 */
export function bindTap(context, callbacks) {
    exec(_bind, context, callbacks)
}


/**
 * 移除tap事件
 * @param  {[type]} context [description]
 * @param  {[type]} opts    [description]
 * @return {[type]}         [description]
 */
export function offTap(context, callbacks) {
    exec(_off, context, callbacks)
}
