"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var axios_1 = __importDefault(require("axios"));
var moment_1 = __importDefault(require("moment"));
var cors_1 = __importDefault(require("cors"));
var express_basic_auth_1 = __importDefault(require("express-basic-auth"));
var app = (0, express_1.default)();
// Add CORS handling for localhost calls in index.html
app.use((0, cors_1.default)());
var GITHUB_URL = 'https://api.github.com/repos/downshift-js/downshift';
var groupOpenAndClosedByMonths = function (data) {
    // Map service response to include current state, created
    var mappedDownshiftResponse = data.map(function (res) {
        var created = (0, moment_1.default)(res.created_at).startOf('month');
        var closed = res.closed_at ? (0, moment_1.default)(res.closed_at).startOf('month') : null;
        var state = res.state;
        return { created: created, closed: closed, state: state };
    });
    var requestsPerMonth = {};
    mappedDownshiftResponse.forEach(function (res) {
        var month = res.created.format('MM-YYYY');
        if (!requestsPerMonth[month]) {
            requestsPerMonth[month] = {
                opened: 0,
                closed: 0,
            };
        }
        //     Code assumes we only want to see if current state is open
        //      if (res.state === 'open') {
        //        requestsPerMonth[month].opened++;
        //      } else {
        //        requestsPerMonth[month].closed++;
        //      }
        //    Code assumes we include every pull request as an opened request
        requestsPerMonth[month].opened++;
        if (res.closed) {
            requestsPerMonth[month].closed++;
        }
    });
    return requestsPerMonth;
};
app.use((0, express_basic_auth_1.default)({
    users: { 'admin': 'password' },
    challenge: true,
}));
app.get('/api/pull', (0, express_basic_auth_1.default)({ users: { 'admin': 'password' }, challenge: true, }), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, groupOpenAndClosedByMonthsData, chartData, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios_1.default.get("".concat(GITHUB_URL, "/pulls?state=all"))];
            case 1:
                data = (_a.sent()).data;
                groupOpenAndClosedByMonthsData = groupOpenAndClosedByMonths(data);
                chartData = {
                    labels: Object.keys(groupOpenAndClosedByMonthsData),
                    datasets: [
                        {
                            label: 'PRs Opened',
                            data: Object.values(groupOpenAndClosedByMonthsData).map(function (data) { return data.opened; }),
                            backgroundColor: 'rgba(255, 206, 86, 0.2)',
                            borderColor: 'rgba(255, 206, 86, 1)',
                            borderWidth: 1,
                        },
                        {
                            label: 'PRs Closed',
                            data: Object.values(groupOpenAndClosedByMonthsData).map(function (data) { return data.closed; }),
                            backgroundColor: 'rgba(144, 238, 144, 0.2)',
                            borderColor: 'rgba(144, 238, 144, 1)',
                            borderWidth: 1,
                        },
                    ],
                };
                res.json(chartData); // Return chart data as JSON
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error(error_1);
                res.status(500).send('Server Error');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("Server listening on port ".concat(PORT));
});
//# sourceMappingURL=index.js.map