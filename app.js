/* ============================================
   NJ Transfer Search — Application Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    const collegeFilter = document.getElementById('collegeFilter');
    const resultsGrid = document.getElementById('resultsGrid');
    const emptyState = document.getElementById('emptyState');
    const resultCount = document.getElementById('resultCount');
    const totalCourses = document.getElementById('totalCourses');

    // College website URLs
    const COLLEGE_URLS = {
        'Atlantic-Cape Community College': 'https://www.atlantic.edu',
        'Bergen Community College': 'https://www.bergen.edu',
        'Brookdale Community College': 'https://www.brookdalecc.edu',
        'Camden County College': 'https://www.camdencc.edu',
        'County College of Morris': 'https://www.ccm.edu',
        'Essex County College': 'https://www.essex.edu',
        'Hudson County Community College': 'https://www.hccc.edu',
        'Mercer County Community College': 'https://www.mccc.edu',
        'Middlesex College': 'https://middlesexcollege.edu',
        'Ocean County College': 'https://www.ocean.edu',
        'Passaic County Community College': 'https://www.pccc.edu',
        'Raritan Valley Community College': 'https://www.raritanval.edu',
        'Rowan College at Burlington County': 'https://www.rcbc.edu',
        'Rowan College of South Jersey - Cumberland Campus': 'https://www.rcsj.edu/cumberland',
        'Rowan College of South Jersey - Gloucester Campus': 'https://www.rcsj.edu/gloucester',
        'Salem Community College': 'https://www.salemcc.edu',
        'Sussex County Community College': 'https://www.sussex.edu',
        'UCNJ Union College of Union County': 'https://www.ucc.edu',
        'Warren County Community College': 'https://www.warren.edu'
    };

    // Populate total count
    totalCourses.textContent = `${COURSE_DATA.length.toLocaleString()} courses`;

    // Populate college filter
    const colleges = [...new Set(COURSE_DATA.map(d => d.college))].sort();
    colleges.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        collegeFilter.appendChild(opt);
    });

    // Extract base Rutgers number (without quotes and extra info)
    function extractBaseNumber(rn) {
        // Get the number part before any space or quote
        return rn.replace(/\s*".*$/, '').trim();
    }

    // Format Rutgers number: insert colons into the leading numeric digits
    // 8 digits: XX:XXX:XXX (e.g. "05300200" → "05:300:200")
    // 7 digits: X:XXX:XXX  (e.g. "1119150"  → "1:119:150")
    function formatRutgersNum(rn) {
        // Strip trailing quoted content and spaces, keep only the base code
        const base = rn.replace(/[\s"\\].*/g, '').trim();
        // 7-8 digit pure numbers: (1-2):(3):(3)
        if (/^\d{7,8}$/.test(base)) {
            return base.replace(/^(\d{1,2})(\d{3})(\d{3})$/, '$1:$2:$3');
        }
        // Numbers ending with letters like NM, MAJ: (1-2):(3):(letters)
        if (/^\d{4,5}[A-Za-z]+$/.test(base)) {
            return base.replace(/^(\d{1,2})(\d{3})([A-Za-z]+)$/, '$1:$2:$3');
        }
        return base;
    }

    // Search function
    // Normalize input: strip colons, dashes, spaces so "01:640:152" → "01640152"
    function normalizeQuery(q) {
        return q.replace(/[:\-\s]/g, '');
    }

    function doSearch() {
        const rawQuery = searchInput.value.trim();
        const college = collegeFilter.value;

        clearBtn.style.display = rawQuery ? 'flex' : 'none';

        if (!rawQuery) {
            resultsGrid.innerHTML = '';
            emptyState.style.display = 'block';
            resultCount.innerHTML = '';
            return;
        }

        emptyState.style.display = 'none';

        // Normalize the query (remove colons, dashes, spaces)
        const query = normalizeQuery(rawQuery).toLowerCase();

        let results = COURSE_DATA.filter(d => {
            // Match on the Rutgers number — search anywhere in the string
            const numMatch = d.rutgersNum.toLowerCase().includes(query);
            // Also allow searching by course name
            const nameMatch = d.name.toLowerCase().includes(query);
            // Also allow searching by community college course code
            const courseMatch = d.course.toLowerCase().includes(query);

            const matchesQuery = numMatch || nameMatch || courseMatch;
            const matchesCollege = !college || d.college === college;
            return matchesQuery && matchesCollege;
        });

        // Sort: exact base number matches first, then partial
        results.sort((a, b) => {
            const aBase = extractBaseNumber(a.rutgersNum);
            const bBase = extractBaseNumber(b.rutgersNum);
            const aExact = aBase === query;
            const bExact = bBase === query;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return a.college.localeCompare(b.college);
        });

        resultCount.innerHTML = `Found <span>${results.length}</span> result${results.length !== 1 ? 's' : ''}`;

        if (results.length === 0) {
            resultsGrid.innerHTML = `
                <div class="no-results">
                    <h3>No results found</h3>
                    <p>Try a different Rutgers course number or course name</p>
                </div>
            `;
            return;
        }

        // Limit display to 200 for performance
        const displayResults = results.slice(0, 200);

        resultsGrid.innerHTML = displayResults.map((d, i) => {
            const coreChips = d.core
                ? d.core.split(',').filter(c => c.trim()).map(c =>
                    `<span class="core-chip">${c.trim()}</span>`
                ).join('')
                : '<span style="color:var(--text-muted)">—</span>';

            return `
                <div class="result-card" style="animation-delay: ${Math.min(i * 30, 500)}ms">
                    <div class="card-top">
                        <div class="course-name">${escapeHtml(d.name)}</div>
                        <a class="college-badge" href="${COLLEGE_URLS[d.college] || '#'}" target="_blank" rel="noopener">${escapeHtml(d.college)}</a>
                    </div>
                    <div class="card-details">
                        <div class="detail-item">
                            <div class="detail-label">Rutgers Course #</div>
                            <div class="detail-value highlight">${escapeHtml(formatRutgersNum(d.rutgersNum))}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">CC Course</div>
                            <div class="detail-value">${escapeHtml(d.course)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Rutgers Credits</div>
                            <div class="detail-value">${escapeHtml(d.rutgersCr)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">CC Credits</div>
                            <div class="detail-value">${escapeHtml(d.ccCr)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Core</div>
                            <div class="detail-value core-tag">${coreChips}</div>
                        </div>
                    </div>
                    ${(d.si_code && d.ri_code && d.si_term && d.ri_term && d.course) ? `
                    <div class="card-actions">
                        <a href="https://njtransfer.org/artweb/crs-srch.cgi?Z~7906181772039765~${encodeURIComponent(d.si_code)}~${encodeURIComponent(d.ri_code)}~${encodeURIComponent(d.course.replace(/\\s+/g, ''))}~${encodeURIComponent(d.si_term)}~${encodeURIComponent(d.ri_term)}~" target="_blank" rel="noopener" class="njt-btn" title="View official equivalency on NJ Transfer">
                            View on NJ Transfer ↗
                        </a>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        if (results.length > 200) {
            resultsGrid.innerHTML += `
                <div class="no-results">
                    <p>Showing 200 of ${results.length} results. Refine your search for more specific results.</p>
                </div>
            `;
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event listeners
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(doSearch, 150);
    });

    collegeFilter.addEventListener('change', doSearch);

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        doSearch();
        searchInput.focus();
    });

    // Popular search tags
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            searchInput.value = tag.dataset.search;
            doSearch();
            searchInput.focus();
        });
    });

    // Focus search on load
    searchInput.focus();
});
