<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>&#x413;&#x440;&#x443;&#x43F;&#x430; &#x410;&#x41F; | &#x41D;&#x430;&#x432;&#x447;&#x430;&#x43B;&#x44C;&#x43D;&#x438;&#x439; &#x43F;&#x43E;&#x440;&#x442;&#x430;&#x43B; &#x437; &#x41C;&#x435;&#x445;&#x430;&#x43D;&#x456;&#x43A;&#x438;</title>
    <!-- &#x421;&#x443;&#x447;&#x430;&#x441;&#x43D;&#x438;&#x439; &#x434;&#x438;&#x437;&#x430;&#x439;&#x43D; -->
    <link rel="stylesheet" href="style.css">
    <!-- &#x414;&#x438;&#x43D;&#x430;&#x43C;&#x456;&#x447;&#x43D;&#x438;&#x439; &#x430;&#x440;&#x445;&#x456;&#x442;&#x435;&#x43A;&#x442;&#x443;&#x440;&#x43D;&#x438;&#x439; &#x444;&#x43E;&#x43D; -->
    <script src="architect-bg.js" defer></script>

    <style>
        body { background: transparent; }
        .architect-card {
            background: rgba(255, 255, 255, 0.9) !important;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(203, 213, 225, 0.8);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
        }
        .user-welcome-card {
            border-left: 5px solid #d97706 !important;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        .user-info-wrapper { display: flex; align-items: center; gap: 16px; }
        .user-avatar-icon {
            width: 48px; height: 48px;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 22px; flex-shrink: 0;
        }
        .welcome-title { font-size: 20px; color: #1e293b; margin: 2px 0; font-weight: 700; }
        .welcome-subtitle { font-size: 13px; color: #64748b; margin: 0; }
        .group-badge {
            display: inline-block;
            background: #e2e8f0; color: #334155;
            font-size: 11px; font-weight: 700;
            padding: 2px 8px; border-radius: 6px;
            text-transform: uppercase; letter-spacing: 0.5px;
        }
        .logout-btn {
            box-sizing: border-box;
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px; font-weight: 600;
            transition: all 0.2s ease;
        }
        .logout-btn:hover { background: #fee2e2; transform: translateY(-1px); }
    </style>
</head>
<body>

    <header>
        <h1>&#x41D;&#x430;&#x432;&#x447;&#x430;&#x43B;&#x44C;&#x43D;&#x438;&#x439; &#x43F;&#x43E;&#x440;&#x442;&#x430;&#x43B; &#x437; &#x41C;&#x435;&#x445;&#x430;&#x43D;&#x456;&#x43A;&#x438;</h1>
        <p>&#x421;&#x442;&#x43E;&#x440;&#x456;&#x43D;&#x43A;&#x430; &#x433;&#x440;&#x443;&#x43F;&#x438;: &#x410;&#x440;&#x445;&#x456;&#x442;&#x435;&#x43A;&#x442;&#x443;&#x440;&#x430; &#x442;&#x430; &#x43F;&#x43B;&#x430;&#x43D;&#x443;&#x432;&#x430;&#x43D;&#x43D;&#x44F;</p>
    </header>

    <nav>
        <a href="index.html">&#x413;&#x43E;&#x43B;&#x43E;&#x432;&#x43D;&#x430;</a>
        <a href="literature.html">&#x41E;&#x441;&#x43D;&#x43E;&#x432;&#x43D;&#x430; &#x43B;&#x456;&#x442;&#x435;&#x440;&#x430;&#x442;&#x443;&#x440;&#x430;</a>
        <a href="groups.html">&#x41D;&#x430;&#x432;&#x447;&#x430;&#x43B;&#x44C;&#x43D;&#x456; &#x433;&#x440;&#x443;&#x43F;&#x438;</a>
    </nav>

    <div class="container">
        <a href="groups.html" class="back-link">&#x2190; &#x41D;&#x430;&#x437;&#x430;&#x434; &#x434;&#x43E; &#x432;&#x438;&#x431;&#x43E;&#x440;&#x443; &#x433;&#x440;&#x443;&#x43F;</a>

        <div id="auth-section" class="architect-card" style="max-width: 500px; margin: 40px auto; text-align: center;">
            <h3 style="color: #1e293b; margin-bottom: 8px;">&#x411;&#x443;&#x434;&#x44C; &#x43B;&#x430;&#x441;&#x43A;&#x430;, &#x43F;&#x440;&#x435;&#x434;&#x441;&#x442;&#x430;&#x432;&#x442;&#x435;&#x441;&#x44F;</h3>
            <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">&#x412;&#x432;&#x435;&#x434;&#x456;&#x442;&#x44C; &#x432;&#x430;&#x448;&#x456; &#x41F;&#x406;&#x411; &#x434;&#x43B;&#x44F; &#x434;&#x43E;&#x441;&#x442;&#x443;&#x43F;&#x443; &#x434;&#x43E; &#x43C;&#x430;&#x442;&#x435;&#x440;&#x456;&#x430;&#x43B;&#x456;&#x432; &#x433;&#x440;&#x443;&#x43F;&#x438; &#x442;&#x430; &#x444;&#x456;&#x43A;&#x441;&#x430;&#x446;&#x456;&#x457; &#x440;&#x435;&#x437;&#x443;&#x43B;&#x44C;&#x442;&#x430;&#x442;&#x456;&#x432;</p>
            <input type="text" id="studentName" placeholder="&#x41D;&#x430;&#x43F;&#x440;&#x438;&#x43A;&#x43B;&#x430;&#x434;: &#x406;&#x432;&#x430;&#x43D; &#x41F;&#x435;&#x442;&#x440;&#x435;&#x43D;&#x43A;&#x43E;" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; box-sizing: border-box; background: #ffffff;">
            <button class="btn" onclick="registerStudent()" style="width: 100%; padding: 12px;">&#x423;&#x432;&#x456;&#x439;&#x442;&#x438; &#x432; &#x441;&#x438;&#x441;&#x442;&#x435;&#x43C;&#x443;</button>
        </div>

        <div id="main-content" style="display: none;">
            <!-- &#x41A;&#x430;&#x440;&#x442;&#x43A;&#x430; &#x430;&#x432;&#x442;&#x43E;&#x440;&#x438;&#x437;&#x43E;&#x432;&#x430;&#x43D;&#x43E;&#x433;&#x43E; &#x43A;&#x43E;&#x440;&#x438;&#x441;&#x442;&#x443;&#x432;&#x430;&#x447;&#x430; -->
            <div class="architect-card user-welcome-card">
                <div class="user-info-wrapper">
                    <div class="user-avatar-icon">&#x1F4D0;</div>
                    <div>
                        <span class="group-badge">&#x413;&#x440;&#x443;&#x43F;&#x430; &#x410;&#x41F;</span>
                        <h3 id="welcomeUser" class="welcome-title"></h3>
                        <p class="welcome-subtitle">&#x412;&#x438; &#x443;&#x441;&#x43F;&#x456;&#x448;&#x43D;&#x43E; &#x430;&#x432;&#x442;&#x43E;&#x440;&#x438;&#x437;&#x43E;&#x432;&#x430;&#x43D;&#x456; &#x432; &#x441;&#x438;&#x441;&#x442;&#x435;&#x43C;&#x456; &#x43A;&#x440;&#x435;&#x441;&#x43B;&#x435;&#x43D;&#x44C; &#x442;&#x430; &#x440;&#x43E;&#x437;&#x440;&#x430;&#x445;&#x443;&#x43D;&#x43A;&#x456;&#x432;.</p>
                    </div>
                </div>
                <button onclick="logoutStudent()" class="logout-btn">&#x417;&#x43C;&#x456;&#x43D;&#x438;&#x442;&#x438; &#x456;&#x43C;'&#x44F; / &#x412;&#x438;&#x439;&#x442;&#x438;</button>
            </div>

            <!-- &#x406;&#x43D;&#x436;&#x435;&#x43D;&#x435;&#x440;&#x43D;&#x456; &#x43A;&#x430;&#x43B;&#x44C;&#x43A;&#x443;&#x43B;&#x44F;&#x442;&#x43E;&#x440;&#x438; -->
            <div class="architect-card">
                <h2>&#x1F9EE; &#x406;&#x43D;&#x436;&#x435;&#x43D;&#x435;&#x440;&#x43D;&#x456; &#x43A;&#x430;&#x43B;&#x44C;&#x43A;&#x443;&#x43B;&#x44F;&#x442;&#x43E;&#x440;&#x438; &#x434;&#x43B;&#x44F; &#x441;&#x430;&#x43C;&#x43E;&#x43F;&#x435;&#x440;&#x435;&#x432;&#x456;&#x440;&#x43A;&#x438;</h2>
                <p style="margin-bottom: 15px; color: #555;">&#x412;&#x438;&#x43A;&#x43E;&#x440;&#x438;&#x441;&#x442;&#x43E;&#x432;&#x443;&#x439;&#x442;&#x435; &#x446;&#x456; &#x43E;&#x43D;&#x43B;&#x430;&#x439;&#x43D;-&#x456;&#x43D;&#x441;&#x442;&#x440;&#x443;&#x43C;&#x435;&#x43D;&#x442;&#x438; &#x434;&#x43B;&#x44F; &#x43F;&#x435;&#x440;&#x435;&#x432;&#x456;&#x440;&#x43A;&#x438; &#x432;&#x430;&#x448;&#x438;&#x445; &#x440;&#x43E;&#x437;&#x440;&#x430;&#x445;&#x443;&#x43D;&#x43A;&#x43E;&#x432;&#x43E;-&#x433;&#x440;&#x430;&#x444;&#x456;&#x447;&#x43D;&#x438;&#x445; &#x440;&#x43E;&#x431;&#x456;&#x442;:</p>

                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <a href="calc-statics.html" class="btn" style="text-decoration: none; text-align: center; flex: 1; min-width: 220px;">
                        &#x1F4CA; &#x41E;&#x43F;&#x43E;&#x440;&#x43D;&#x456; &#x440;&#x435;&#x430;&#x43A;&#x446;&#x456;&#x457; &#x431;&#x430;&#x43B;&#x43A;&#x438;
                    </a>
                    <a href="calc-tension.html" class="btn" style="text-decoration: none; text-align: center; flex: 1; min-width: 220px;">
                        &#x1F4D0; &#x420;&#x43E;&#x437;&#x442;&#x44F;&#x433; &#x456; &#x441;&#x442;&#x438;&#x441;&#x43A;
                    </a>
                </div>
            </div>

            <div class="architect-card">
                <h2>&#x1F4CB; &#x41F;&#x440;&#x430;&#x43A;&#x442;&#x438;&#x447;&#x43D;&#x456; &#x437;&#x430;&#x432;&#x434;&#x430;&#x43D;&#x43D;&#x44F;</h2>
                <div class="task-item">
                    <div class="task-info">
                        <h4>&#x41F;&#x440;&#x430;&#x43A;&#x442;&#x438;&#x447;&#x43D;&#x430; &#x440;&#x43E;&#x431;&#x43E;&#x442;&#x430; &#x2116;1: &#xAB;&#x41E;&#x441;&#x43D;&#x43E;&#x432;&#x438; &#x440;&#x43E;&#x437;&#x440;&#x430;&#x445;&#x443;&#x43D;&#x43A;&#x443; &#x430;&#x440;&#x445;&#x456;&#x442;&#x435;&#x43A;&#x442;&#x443;&#x440;&#x43D;&#x438;&#x445; &#x43A;&#x43E;&#x43D;&#x441;&#x442;&#x440;&#x443;&#x43A;&#x446;&#x456;&#x439; &#x43D;&#x430; &#x43C;&#x456;&#x446;&#x43D;&#x456;&#x441;&#x442;&#x44C;&#xBB;</h4>
                        <p>&#x412;&#x438;&#x437;&#x43D;&#x430;&#x447;&#x435;&#x43D;&#x43D;&#x44F; &#x43D;&#x430;&#x432;&#x430;&#x43D;&#x442;&#x430;&#x436;&#x435;&#x43D;&#x44C; &#x442;&#x430; &#x43F;&#x435;&#x440;&#x435;&#x432;&#x456;&#x440;&#x43A;&#x430; &#x435;&#x43B;&#x435;&#x43C;&#x435;&#x43D;&#x442;&#x456;&#x432;.</p>
                    </div>
                    <a href="literature.html" class="btn">&#x41C;&#x435;&#x442;&#x43E;&#x434;&#x438;&#x447;&#x43A;&#x430;</a>
                </div>
            </div>

            <div class="architect-card">
                <h2>&#x270D;&#xFE0F; &#x415;&#x43A;&#x441;&#x43F;&#x440;&#x435;&#x441;-&#x442;&#x435;&#x441;&#x442; &#x437; &#x43C;&#x435;&#x445;&#x430;&#x43D;&#x456;&#x43A;&#x438;</h2>
                <form id="mechanicsTest" onsubmit="return false;">
                    <div class="test-question">
                        <p>1. &#x429;&#x43E; &#x454; &#x43C;&#x456;&#x440;&#x43E;&#x44E; &#x456;&#x43D;&#x435;&#x440;&#x442;&#x43D;&#x43E;&#x441;&#x442;&#x456; &#x442;&#x456;&#x43B;&#x430;?</p>
                        <div class="options" style="margin: 10px 0;">
                            <label style="display: block; margin-bottom: 5px;"><input type="radio" name="q1" value="a"> &#x410;) &#x412;&#x430;&#x433;&#x430;</label>
                            <label style="display: block;"><input type="radio" name="q1" value="b"> &#x411;) &#x41C;&#x430;&#x441;&#x430;</label>
                        </div>
                    </div>
                    <button type="button" class="btn" onclick="checkTest()">&#x417;&#x434;&#x430;&#x442;&#x438; &#x442;&#x435;&#x441;&#x442;</button>
                    <div id="testResult" class="result-box" style="display: none; margin-top: 10px; padding: 10px; background: #eef2f7; border-radius: 6px;"></div>
                </form>
            </div>

            <div class="architect-card">
                <h2>&#x1F4E4; &#x417;&#x434;&#x430;&#x442;&#x438; &#x432;&#x438;&#x43A;&#x43E;&#x43D;&#x430;&#x43D;&#x443; &#x440;&#x43E;&#x431;&#x43E;&#x442;&#x443;</h2>
                <form onsubmit="submitWork(event)">
                    <div class="form-group" style="margin-bottom: 12px;">
                        <label for="workNumber" style="display: block; margin-bottom: 5px;">&#x41E;&#x431;&#x435;&#x440;&#x456;&#x442;&#x44C; &#x440;&#x43E;&#x431;&#x43E;&#x442;&#x443;:</label>
                        <select id="workNumber" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #cbd5e0; background: #fff;">
                            <option>&#x41F;&#x440;&#x430;&#x43A;&#x442;&#x438;&#x447;&#x43D;&#x430; &#x440;&#x43E;&#x431;&#x43E;&#x442;&#x430; &#x2116;1</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label for="workFile" style="display: block; margin-bottom: 5px;">&#x41F;&#x440;&#x438;&#x43A;&#x440;&#x456;&#x43F;&#x438;&#x442;&#x438; &#x444;&#x430;&#x439;&#x43B;:</label>
                        <input type="file" id="workFile" required style="width: 100%;">
                    </div>
                    <button type="submit" class="btn">&#x41D;&#x430;&#x434;&#x456;&#x441;&#x43B;&#x430;&#x442;&#x438; &#x432;&#x438;&#x43A;&#x43B;&#x430;&#x434;&#x430;&#x447;&#x443;</button>
                </form>
            </div>
        </div>
    </div>

    <footer>
        <p>&copy; &#x41D;&#x430;&#x432;&#x447;&#x430;&#x43B;&#x44C;&#x43D;&#x438;&#x439; &#x43F;&#x43E;&#x440;&#x442;&#x430;&#x43B; &#x437; &#x43C;&#x435;&#x445;&#x430;&#x43D;&#x456;&#x43A;&#x438; | &#x413;&#x440;&#x443;&#x43F;&#x430; &#x410;&#x41F;</p>
    </footer>

    <script>
        const STORAGE_KEY = 'studentName_AP';

        function getSavedName() {
            try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
        }

        window.addEventListener('load', function () {
            const savedName = getSavedName();
            if (savedName) showPortal(savedName);
        });

        function registerStudent() {
            const name = document.getElementById('studentName').value.trim();
            if (!name) { alert('\u0412\u0432\u0435\u0434\u0456\u0442\u044c \u041f\u0406\u0411!'); return; }
            try { localStorage.setItem(STORAGE_KEY, name); } catch (e) {}
            showPortal(name);
        }

        function showPortal(name) {
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            document.getElementById('welcomeUser').textContent = '\u0412\u0456\u0442\u0430\u0454\u043c\u043e, ' + name + '!';
        }

        function logoutStudent() {
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
            location.reload();
        }

        function checkTest() {
            const name = getSavedName() || '\u2014';
            const q1 = document.querySelector('input[name="q1"]:checked');
            const res = document.getElementById('testResult');
            res.style.display = 'block';

            if (!q1) {
                res.textContent = '\u041e\u0431\u0435\u0440\u0456\u0442\u044c \u0432\u0430\u0440\u0456\u0430\u043d\u0442 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0456.';
                return;
            }
            const score = q1.value === 'b' ? 1 : 0;

            // textContent \u0437\u0430\u043c\u0456\u0441\u0442\u044c innerHTML \u2014 \u0437\u0430\u0445\u0438\u0441\u0442 \u0432\u0456\u0434 \u0432\u0441\u0442\u0430\u0432\u043a\u0438 \u043a\u043e\u0434\u0443 \u0447\u0435\u0440\u0435\u0437 \u0456\u043c'\u044f
            res.textContent = '';
            res.append('\u0421\u0442\u0443\u0434\u0435\u043d\u0442: ');
            const nameEl = document.createElement('b');
            nameEl.textContent = name;
            res.append(nameEl, ' | \u0411\u0430\u043b\u0456\u0432: ');
            const scoreEl = document.createElement('b');
            scoreEl.textContent = score + ' \u0437 1';
            res.append(scoreEl);
        }

        function submitWork(e) {
            e.preventDefault();
            alert('\u0420\u043e\u0431\u043e\u0442\u0443 \u0443\u0441\u043f\u0456\u0448\u043d\u043e \u043d\u0430\u0434\u0456\u0441\u043b\u0430\u043d\u043e!');
        }
    </script>

</body>
</html>
