/**
 * Wrapper para eliminar try/catch en controllers async
 * 
 * Uso:
 *   router.get('/', catchAsync(async (req, res) => { ... }));
 * 
 * Cualquier error lanzado será capturado y pasado a next()
 * para que lo maneje el errorHandler middleware.
 */

const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = catchAsync;
