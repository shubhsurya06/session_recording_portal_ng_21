import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Layout } from './pages/layout/layout';
import { BatchMaster } from './pages/batch-master/batch-master';
import { authGuard } from './core/guards/auth-guards-guard';
import { Candidates } from './pages/candidates/candidates';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login, title: 'Login:Session Recording' },
    {
        path: '', component: Layout,
        children: [
            { path: 'dashboard', component: Dashboard, title: 'Dashboard:Session Recording' },
            { path: 'batch', component: BatchMaster, title: 'Batch Master:Session Recording' },
            { path: 'candidate', component: Candidates, title: 'Candidate:Session Recording' },
        ],
        canActivate: [authGuard]
    },
];
