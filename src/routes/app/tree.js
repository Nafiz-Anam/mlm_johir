import { Router } from "express";
const Tree = require('../../controllers/app/treeController')
const router = Router()

router.get('/genealogy_tree',Tree.getGenealogyTree)
router.get('/sponsor_tree',Tree.getSponsorTree)
router.get('/downline_members',Tree.getDownlineMembers)
router.get('/referral_members',Tree.getReferralMembers)
router.get('/tree_view',Tree.getTreeView)
router.get('/step_view',Tree.getStepView)
router.get('/go_to_tree',Tree.goToTree)

export default router